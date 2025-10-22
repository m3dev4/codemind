export const resetPasswordEmailTemplate = (firstName: string, resetToken: string): string => {
  const resetLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Réinitialisation de mot de passe</title>
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
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      padding: 40px 20px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .emoji {
      font-size: 50px;
      margin-bottom: 10px;
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
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .reset-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      padding: 16px 50px;
      border-radius: 30px;
      font-weight: 600;
      font-size: 16px;
      transition: transform 0.2s;
    }
    .reset-button:hover {
      transform: translateY(-2px);
    }
    .token-box {
      background-color: #f8f9fa;
      border: 2px dashed #dee2e6;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      word-break: break-all;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      color: #495057;
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
    .danger {
      background-color: #f8d7da;
      border-left: 4px solid #dc3545;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
      font-size: 14px;
      color: #721c24;
    }
    .expiry {
      text-align: center;
      font-size: 14px;
      color: #777;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="emoji">🔒</div>
      <h1>Réinitialisation de mot de passe</h1>
    </div>
    <div class="content">
      <p class="greeting">Bonjour <strong>${firstName}</strong>,</p>
      
      <p class="message">
        Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte CodeMind. 
        Si vous êtes à l'origine de cette demande, cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.
      </p>
      
      <div class="button-container">
        <a href="${resetLink}" class="reset-button">
          Réinitialiser mon mot de passe
        </a>
      </div>
      
      <p class="expiry">⏱️ Ce lien expire dans 1 heure</p>
      
      <div class="warning">
        💡 <strong>Astuce :</strong> Si le bouton ne fonctionne pas, vous pouvez copier et coller le lien ci-dessous dans votre navigateur :
      </div>
      
      <div class="token-box">
        ${resetLink}
      </div>
      
      <div class="danger">
        🚨 <strong>Attention :</strong> Si vous n'avez PAS demandé cette réinitialisation, ignorez cet email et sécurisez votre compte immédiatement. 
        Quelqu'un pourrait tenter d'accéder à votre compte.
      </div>
      
      <p class="message">
        Pour votre sécurité, ce lien de réinitialisation ne peut être utilisé qu'une seule fois et expire après 1 heure.
      </p>
    </div>
    <div class="footer">
      <p>© 2025 CodeMind. Tous droits réservés.</p>
      <p>Besoin d'aide ? Contactez-nous à support@codemind.com</p>
    </div>
  </div>
</body>
</html>
  `;
};
