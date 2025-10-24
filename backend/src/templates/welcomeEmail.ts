export const welcomeEmailTemplate = (firstName: string, email: string): string => {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue sur CodeMind</title>
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
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      padding: 50px 20px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 700;
    }
    .emoji {
      font-size: 60px;
      margin-bottom: 10px;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 20px;
      color: #333;
      margin-bottom: 20px;
      font-weight: 600;
    }
    .message {
      font-size: 16px;
      color: #555;
      line-height: 1.8;
      margin-bottom: 20px;
    }
    .features {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin: 30px 0;
    }
    .feature-item {
      display: flex;
      align-items: flex-start;
      margin: 15px 0;
    }
    .feature-icon {
      font-size: 24px;
      margin-right: 15px;
    }
    .feature-text {
      flex: 1;
    }
    .feature-title {
      font-weight: 600;
      color: #333;
      margin-bottom: 5px;
    }
    .feature-description {
      font-size: 14px;
      color: #666;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      padding: 15px 40px;
      border-radius: 30px;
      font-weight: 600;
      margin: 20px 0;
      text-align: center;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px 30px;
      text-align: center;
      font-size: 14px;
      color: #888;
    }
    .account-info {
      background-color: #e7f3ff;
      border-left: 4px solid #2196F3;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
      font-size: 14px;
      color: #0d47a1;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="emoji">🎉</div>
      <h1>Bienvenue sur CodeMind !</h1>
    </div>
    <div class="content">
      <p class="greeting">Félicitations ${firstName} ! 🚀</p>
      
      <p class="message">
        Votre compte a été créé avec succès. Nous sommes ravis de vous accueillir dans la communauté CodeMind, 
        la plateforme qui révolutionne votre façon d'apprendre et de coder.
      </p>
      
      <div class="account-info">
        📧 <strong>Email confirmé :</strong> ${email}
      </div>
      
      <div class="features">
        <div class="feature-item">
          <div class="feature-icon">💻</div>
          <div class="feature-text">
            <div class="feature-title">Éditeur de Code Intégré</div>
            <div class="feature-description">Écrivez et testez votre code directement dans le navigateur</div>
          </div>
        </div>
        
        <div class="feature-item">
          <div class="feature-icon">📚</div>
          <div class="feature-text">
            <div class="feature-title">Bibliothèque de Ressources</div>
            <div class="feature-description">Accédez à des milliers de tutoriels et exercices</div>
          </div>
        </div>
        
        <div class="feature-item">
          <div class="feature-icon">🤝</div>
          <div class="feature-text">
            <div class="feature-title">Communauté Active</div>
            <div class="feature-description">Échangez avec des développeurs du monde entier</div>
          </div>
        </div>
        
        <div class="feature-item">
          <div class="feature-icon">🏆</div>
          <div class="feature-text">
            <div class="feature-title">Défis & Certifications</div>
            <div class="feature-description">Progressez et obtenez des badges de compétences</div>
          </div>
        </div>
      </div>
      
      <p class="message">
        Prêt à commencer votre voyage de développeur ? Explorez la plateforme et découvrez tout ce que 
        CodeMind a à offrir !
      </p>
      
      <div style="text-align: center;">
        <a href="https://codemind.com/dashboard" class="cta-button">
          Accéder à mon Dashboard
        </a>
      </div>
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
