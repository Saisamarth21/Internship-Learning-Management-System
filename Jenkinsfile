pipeline {
  agent any

  options {
    skipDefaultCheckout()
  }

  tools {
    nodejs 'NodeJS'
  }

  environment {
    SONAR_PROJECT_KEY  = 'learning-management-system'
    SONAR_TOKEN        = credentials('SonarCred')
    OWASP_CLI_HOME     = tool 'OWASP-Dependency-Check'
    SONAR_SCANNER_HOME = tool 'SonarQube-Scanner'
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
          sh 'npm ci'
          sh 'npm run build'
        }
        dir('backend') {
          sh 'npm ci'
        }
      }
    }

    stage('OWASP Dependency Check') {
      steps {
        catchError(buildResult: 'SUCCESS', stageResult: 'SUCCESS') {
          sh 'mkdir -p dependency-check-report'
          sh """
            ${OWASP_CLI_HOME}/bin/dependency-check.sh \
              --project "${SONAR_PROJECT_KEY}" \
              --scan . \
              --format XML \
              --format HTML \
              --out dependency-check-report || true
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
        withSonarQubeEnv('SonarQube-Scanner') {
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
          timeout(time: 5, unit: 'MINUTES') {
            waitForQualityGate abortPipeline: true
          }
        }
      }
    }

    stage('Build Docker Images') {
      when { expression { currentBuild.currentResult == 'SUCCESS' } }
      steps {
        script {
          // Tags with build number
          def feTag = "saisamarth21/lms-frontend:1.0.${env.BUILD_NUMBER}"
          def beTag = "saisamarth21/lms-backend:1.0.${env.BUILD_NUMBER}"

          // Build frontend image
          dir('frontend') {
            echo "Building Docker image ${feTag}"
            frontendImage = docker.build(feTag, ".")
          }

          // Build backend image
          dir('backend') {
            echo "Building Docker image ${beTag}"
            backendImage = docker.build(beTag, ".")
          }
        }
      }
    }
  }
}
