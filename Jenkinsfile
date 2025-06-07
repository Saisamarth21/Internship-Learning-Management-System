pipeline {
  agent any

  tools {
    nodejs 'NodeJS'
  }

  environment {
    SONAR_PROJECT_KEY = 'learning-management-system'
    SONAR_TOKEN       = credentials('SonarCred')
    // Bind the OWASP Dependency-Check installation named "OWASP"
    OWASP_CLI_HOME    = tool 'OWASP-Dependency-Check'
  }

  stages {
    stage('Checkout') {
      steps {
        git branch: 'main',
            url:           'https://github.com/Saisamarth21/Internship-Learning-Management-System.git',
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

    stage('OWASP Dependency Check') {
      steps {
        catchError(buildResult: 'SUCCESS', stageResult: 'SUCCESS') {
          // Run the OWASP dependency-check CLI over the entire workspace
          sh """
            ${OWASP_CLI_HOME}/bin/dependency-check.sh \
              --project "${SONAR_PROJECT_KEY}" \
              --scan . \
              --format XML \
              --format HTML \
              --out dependency-check-report
          """
          // Publish the XML report and don’t fail the build on findings
          dependencyCheckPublisher(
            pattern: 'dependency-check-report/dependency-check-report.xml',
            stopBuild: false
          )
        }
      }
    }
  }
}
