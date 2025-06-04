import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const readTemplate = (templateName: string) => {
  const templatePath = path.join(process.cwd(), 'src', 'utils', 'templates', templateName);
  return fs.readFileSync(templatePath, 'utf-8');
};

export const getVerifyEmailTemplate = (url: string, code: string) => {
  let template = readTemplate('verifyEmail.html');
  
 
  template = template.replace('{{url}}', url);
  template = template.replace('{{code}}', code);

  return {
    subject: "Verify your email address",
    text: `Click on the link and enter the code below to verify your email address: ${url} Code: ${code}`,
    html: template
  };
};