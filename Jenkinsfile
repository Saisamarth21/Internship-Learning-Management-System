pipeline {
  agent any

  tools {
    nodejs 'NodeJS'
  }

  environment {
    SONAR_PROJECT_KEY    = 'learning-management-system'
    SONAR_TOKEN          = credentials('SonarCred')
    OWASP_CLI_HOME       = tool 'OWASP-Dependency-Check'
    SONAR_SCANNER_HOME   = tool 'SonarQube-Scanner'
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
          sh """
            ${OWASP_CLI_HOME}/bin/dependency-check.sh \
              --project "${SONAR_PROJECT_KEY}" \
              --scan . \
              --format XML \
              --format HTML \
              --out dependency-check-report
          """
          dependencyCheckPublisher(
            pattern: 'dependency-check-report/dependency-check-report.xml',
            stopBuild: false
          )
        }
      }
    }

    stage('SonarQube Analysis') {
      when { expression { currentBuild.currentResult == 'SUCCESS' } }
      steps {
        withSonarQubeEnv('SonarQube') {
          sh """
            ${SONAR_SCANNER_HOME}/bin/sonar-scanner \
              -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
              -Dsonar.sources=frontend,backend \
              -Dsonar.host.url=${env.SONAR_HOST_URL} \
              -Dsonar.login=${SONAR_TOKEN}
          """
        }
      }
      post {
        always {
          // Wait up to 5 minutes for SonarQube Quality Gate
          timeout(time: 5, unit: 'MINUTES') {
            waitForQualityGate abortPipeline: true
          }
        }
      }
    }
  }
}
