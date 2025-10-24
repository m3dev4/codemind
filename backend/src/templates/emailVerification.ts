export const emailVerificationTemplate = (firstName: string, verificationCode: string): string => {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vérification de votre email</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f7fa;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      color: #333;
      margin-bottom: 20px;
    }
    .message {
      font-size: 16px;
      color: #555;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .code-box {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-radius: 8px;
      padding: 30px;
      text-align: center;
      margin: 30px 0;
    }
    .code {
      font-size: 42px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #667eea;
      font-family: 'Courier New', monospace;
    }
    .expiry {
      font-size: 14px;
      color: #777;
      margin-top: 15px;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px 30px;
      text-align: center;
      font-size: 14px;
      color: #888;
    }
    .warning {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
      font-size: 14px;
      color: #856404;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Vérification Email</h1>
    </div>
    <div class="content">
      <p class="greeting">Bonjour <strong>${firstName}</strong>,</p>
      
      <p class="message">
        Merci de vous être inscrit sur CodeMind ! Pour finaliser votre inscription et accéder à votre compte, 
        veuillez vérifier votre adresse email en utilisant le code ci-dessous :
      </p>
      
      <div class="code-box">
        <div class="code">${verificationCode}</div>
        <p class="expiry">⏱️ Ce code expire dans 15 minutes</p>
      </div>
      
      <div class="warning">
        ⚠️ <strong>Important :</strong> Si vous n'avez pas créé de compte, vous pouvez ignorer cet email en toute sécurité.
      </div>
      
      <p class="message">
        Une fois votre email vérifié, vous pourrez profiter de toutes les fonctionnalités de CodeMind.
      </p>
    </div>
    <div class="footer">
      <p>© 2025 CodeMind. Tous droits réservés.</p>
      <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>
  `;
};
