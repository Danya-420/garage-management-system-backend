// src/services/user.service.ts

import { ConnectionPool, Transaction, Request as SqlRequest, TYPES } from 'mssql';
import { dbConfig } from '../config/db';

interface UserQueryParams {
    search?: string;
    role?: 'Default member' | 'Manager' | 'Admin';
    page?: number;
    limit?: number;
}

export class UserService {
    private async getConnection(): Promise<ConnectionPool> {
        try {
            const pool = new ConnectionPool(dbConfig);
            await pool.connect();
            return pool;
        } catch (err) {
            console.error('Database connection failed:', err);
            throw new Error('Database connection failed');
        }
    }

    public async getAllUsers(queryParams: UserQueryParams) {
        // Деструктуруємо параметри, встановлюючи значення за замовчуванням
        const page = queryParams.page ? Math.max(1, queryParams.page) : 1; // Завжди мінімум 1
        const limit = queryParams.limit ? Math.max(1, queryParams.limit) : 10; // Завжди мінімум 1
        const offset = (page - 1) * limit;
        const search = queryParams.search;
        const role = queryParams.role;

        const pool = await this.getConnection();
        try {
            const request = new SqlRequest(pool);

            // Будуємо WHERE clause для основного запиту
            let whereClause = 'WHERE 1=1';
            if (search) {
                whereClause += ` AND (u.name LIKE '%' + @search + '%' OR u.email LIKE '%' + @search + '%')`;
                request.input('search', TYPES.NVarChar, search);
            }
            if (role) {
                whereClause += ` AND (
                    (a.userId IS NOT NULL AND @role = 'Admin') OR
                    (m.userId IS NOT NULL AND @role = 'Manager') OR
                    (r.userId IS NOT NULL AND @role = 'Default member')
                )`;
                request.input('role', TYPES.NVarChar, role);
            }

            // Запит для отримання загальної кількості користувачів (для пагінації)
            // Використовуємо окремий запит для count, щоб уникнути конфліктів з ORDER BY та OFFSET/FETCH
            const countRequest = new SqlRequest(pool); // Новий об'єкт request для count
            let countQuery = `
                SELECT COUNT(u.userId) AS totalCount
                FROM Users u
                LEFT JOIN RegisteredUser r ON u.userId = r.userId
                LEFT JOIN Administrator a ON u.userId = a.userId
                LEFT JOIN Manager m ON u.userId = m.userId
                LEFT JOIN GarageUnit gu ON u.userId = gu.ownerId
                ${whereClause}; -- Використовуємо той самий whereClause
            `;
            // Передаємо параметри і для countRequest
            if (search) {
                countRequest.input('search', TYPES.NVarChar, search);
            }
            if (role) {
                countRequest.input('role', TYPES.NVarChar, role);
            }

            const countResult = await countRequest.query(countQuery);
            const totalUsers = countResult.recordset[0].totalCount;

            // Основний запит для отримання пагінованих користувачів
            let query = `
                SELECT
                    u.userId,
                    u.name,
                    u.email,
                    u.phone,
                    u.registrationDate,
                    u.userStatus,
                    u.photoUrl,
                    CASE
                        WHEN a.userId IS NOT NULL THEN 'Admin'
                        WHEN m.userId IS NOT NULL THEN 'Manager'
                        WHEN r.userId IS NOT NULL THEN 'Default member'
                        ELSE 'Unknown'
                    END AS role,
                    ISNULL(r.paymentBalance, 0) AS personalDebt,
                    gu.unitId AS garageNumber
                FROM
                    Users u
                LEFT JOIN
                    RegisteredUser r ON u.userId = r.userId
                LEFT JOIN
                    Administrator a ON u.userId = a.userId
                LEFT JOIN
                    Manager m ON u.userId = m.userId
                LEFT JOIN
                    GarageUnit gu ON u.userId = gu.ownerId
                ${whereClause} -- Використовуємо той самий whereClause
                ORDER BY u.userId
                OFFSET @offset ROWS
                FETCH NEXT @limit ROWS ONLY;
            `;
            // Передаємо параметри для основного запиту
            request.input('offset', TYPES.Int, offset);
            request.input('limit', TYPES.Int, limit);


            const result = await request.query(query);

            return {
                users: result.recordset.map(user => {
                    const { passwordHash, ...userWithoutPasswordHash } = user;
                    return userWithoutPasswordHash;
                }),
                totalUsers,
                currentPage: page,
                totalPages: Math.ceil(totalUsers / limit)
            };

        } catch (error) {
            console.error('Error fetching users:', error);
            throw new Error('Failed to retrieve users');
        } finally {
            pool.close();
        }
    }

    public async getUserById(userId: number) {
        const pool = await this.getConnection();
        try {
            const request = new SqlRequest(pool);
            const result = await request
                .input('userId', TYPES.Int, userId)
                .query(`
                    SELECT
                        u.userId,
                        u.name,
                        u.email,
                        u.phone,
                        u.registrationDate,
                        u.userStatus,
                        u.photoUrl,
                        CASE
                            WHEN a.userId IS NOT NULL THEN 'Admin'
                            WHEN m.userId IS NOT NULL THEN 'Manager'
                            WHEN r.userId IS NOT NULL THEN 'Default member'
                            ELSE 'Unknown'
                        END AS role,
                        ISNULL(r.paymentBalance, 0) AS personalDebt,
                        r.membershipId,
                        r.notificationSettings,
                        gu.unitId AS garageUnitId,
                        gu.location AS garageLocation,
                        gu.size AS garageSize,
                        gu.status AS garageStatus,
                        gu.accessSettings AS garageAccessSettings
                    FROM
                        Users u
                    LEFT JOIN
                        RegisteredUser r ON u.userId = r.userId
                    LEFT JOIN
                        Administrator a ON u.userId = a.userId
                    LEFT JOIN
                        Manager m ON u.userId = m.userId
                    LEFT JOIN
                        GarageUnit gu ON u.userId = gu.ownerId
                    WHERE u.userId = @userId
                `);
            
            if (result.recordset.length > 0) {
                const { passwordHash, ...userWithoutPasswordHash } = result.recordset[0];
                return userWithoutPasswordHash;
            }
            return null;
        } catch (error) {
            console.error('Error fetching user by ID:', error);
            throw new Error('Failed to retrieve user');
        } finally {
            pool.close();
        }
    }

    public async updateUserRole(userId: number, newRole: 'Default member' | 'Manager' | 'Admin') {
        const pool = await this.getConnection();
        const transaction = new Transaction(pool);
        try {
            await transaction.begin();

            const request = new SqlRequest(transaction);

            await request.input('userId_del', TYPES.Int, userId).query(`
                DELETE FROM Administrator WHERE userId = @userId_del;
                DELETE FROM Manager WHERE userId = @userId_del;
                DELETE FROM RegisteredUser WHERE userId = @userId_del;
            `);

            let insertQuery: string;
            switch (newRole) {
                case 'Admin':
                    insertQuery = `INSERT INTO Administrator (userId, adminLevel) VALUES (@userId_ins, 1);`;
                    break;
                case 'Manager':
                    insertQuery = `INSERT INTO Manager (userId) VALUES (@userId_ins);`;
                    break;
                case 'Default member':
                    insertQuery = `INSERT INTO RegisteredUser (userId, membershipId) VALUES (@userId_ins, NEWID());`;
                    break;
                default:
                    throw new Error('Invalid role specified');
            }
            await request.input('userId_ins', TYPES.Int, userId).query(insertQuery);

            await transaction.commit();
            return { success: true, message: `User ${userId} role updated to ${newRole}` };

        } catch (error) {
            await transaction.rollback();
            console.error('Error updating user role:', error);
            throw new Error('Failed to update user role');
        } finally {
            pool.close();
        }
    }
}
