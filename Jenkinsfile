pipeline {
  agent any

  tools {
    nodejs 'NodeJS'
  }

  environment {
    SONAR_PROJECT_KEY = 'learning-management-system'
    SONAR_TOKEN       = credentials('SonarCred')
  }

  stages {
    stage('Checkout') {
      steps {
        git branch: 'main',
            url: 'https://github.com/Saisamarth21/Internship-Learning-Management-System.git',
            credentialsId: 'GithubCred'
      }
    }

    stage('Install & Build') {
      steps {
        dir('frontend') {
          echo 'Installing & building frontend...'
          sh 'npm ci'
          sh 'npm run build'
        }
        dir('backend') {
          echo 'Installing backend dependencies...'
          sh 'npm ci'
        }
      }
    }
  }
}
