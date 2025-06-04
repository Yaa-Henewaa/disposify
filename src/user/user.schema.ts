import { body, ValidationChain } from 'express-validator';


export class UserSchema {
    static register(): ValidationChain[] {
        return [
            body('name').notEmpty().withMessage('Name is required'),
            body('email').isEmail().withMessage('Invalid email address'),
            body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
            body('confirmPassword')
                .isLength({ min: 6 })
                .withMessage('Confirm Password must be at least 6 characters long')
                .custom((value, { req }) => {
                    if (value !== req.body.password) {
                        throw new Error('Passwords do not match');
                    }
                    return true;
                }),
            body('isAdmin').optional().isBoolean()
        ];
    }

    static updateUser(): ValidationChain[] {
        return [
            body('name').optional().notEmpty().withMessage('Name is required'),
            body('email').optional().isEmail().withMessage('Invalid email address'),
            body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
            body('isAdmin').optional().isBoolean()
        ];
    }

    static login(): ValidationChain[] {
        return [
            body('email').isEmail().withMessage('Invalid email address'),
            body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
        ];
    }

    static verificationCode(): ValidationChain[] {
        return [
            body('verificationCode')
                .isLength({ min: 6, max: 6 })
                .withMessage('Verification code must be exactly 6 characters long')
        ];
    }

    static resetPassword(): ValidationChain[] {
        return [
            body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
            body('verificationCode')
                .isLength({ min: 6, max: 6 })
                .withMessage('Verification code must be exactly 6 characters long')
        ];
    }

    static forgotPassword(): ValidationChain[] {
        return [
            body('email').isEmail().withMessage('Invalid email address')
        ];
    }


}


