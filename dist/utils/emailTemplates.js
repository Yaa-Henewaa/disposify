"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVerifyEmailTemplate = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const readTemplate = (templateName) => {
    const templatePath = path_1.default.join(process.cwd(), 'src', 'utils', 'templates', templateName);
    return fs_1.default.readFileSync(templatePath, 'utf-8');
};
const getVerifyEmailTemplate = (url, code) => {
    let template = readTemplate('verifyEmail.html');
    template = template.replace('{{url}}', url);
    template = template.replace('{{code}}', code);
    return {
        subject: "Verify your email address",
        text: `Click on the link and enter the code below to verify your email address: ${url} Code: ${code}`,
        html: template
    };
};
exports.getVerifyEmailTemplate = getVerifyEmailTemplate;
