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
          def feTag = "saisamarth21/lms-frontend:1.0.${env.BUILD_NUMBER}"
          def beTag = "saisamarth21/lms-backend:1.0.${env.BUILD_NUMBER}"

          dir('frontend') {
            echo "Building Docker image ${feTag}"
            docker.build(feTag, ".")
          }

          dir('backend') {
            echo "Building Docker image ${beTag}"
            docker.build(beTag, ".")
          }
        }
      }
    }

    stage('Trivy Scan Images') {
      when { expression { currentBuild.currentResult == 'SUCCESS' } }
      steps {
        script {
          def feTag = "saisamarth21/lms-frontend:1.0.${env.BUILD_NUMBER}"
          def beTag = "saisamarth21/lms-backend:1.0.${env.BUILD_NUMBER}"

          echo "Scanning ${feTag} with Trivy"
          sh """
            trivy --severity HIGH,CRITICAL --no-progress \
              image --format table \
              --output trivy-frontend-report.txt \
              ${feTag}
          """

          echo "Scanning ${beTag} with Trivy"
          sh """
            trivy --severity HIGH,CRITICAL --no-progress \
              image --format table \
              --output trivy-backend-report.txt \
              ${beTag}
          """
        }
      }
      post {
        always {
          archiveArtifacts artifacts: 'trivy-frontend-report.txt, trivy-backend-report.txt', fingerprint: true
        }
      }
    }

    stage('Push to Docker Hub') {
      when { expression { currentBuild.currentResult == 'SUCCESS' } }
      steps {
        script {
          def feTag = "saisamarth21/lms-frontend:1.0.${env.BUILD_NUMBER}"
          def beTag = "saisamarth21/lms-backend:1.0.${env.BUILD_NUMBER}"

          docker.withRegistry('', 'DockerCred') {
            echo "Pushing ${feTag}"
            docker.image(feTag).push()
            echo "Pushing ${beTag}"
            docker.image(beTag).push()
          }
        }
      }
    }

    stage('Update Kubernetes Manifests') {
      when { expression { currentBuild.currentResult == 'SUCCESS' } }
      steps {
        withCredentials([usernamePassword(credentialsId: 'GithubCred', usernameVariable: 'GIT_USER', passwordVariable: 'GIT_PAT')]) {
          script {
            // Clone the manifests repo
            dir('k8s-manifests') {
              checkout([
                $class: 'GitSCM',
                branches: [[ name: '*/main' ]],
                userRemoteConfigs: [[
                  url:           'https://github.com/Saisamarth21/Kubernetes-Manifest-Files.git',
                  credentialsId: 'GithubCred'
                ]],
                extensions: [[ $class: 'LocalBranch', localBranch: 'main' ]]
              ])

              // Define new tags
              def feTag = "saisamarth21/lms-frontend:1.0.${env.BUILD_NUMBER}"
              def beTag = "saisamarth21/lms-backend:1.0.${env.BUILD_NUMBER}"

              // Update frontend-deployment.yaml
              sh """
                sed -i 's#image: saisamarth21/lms-frontend:.*#image: ${feTag}#' \
                  K8s-lms-site/frontend-deployment.yaml
              """

              // Update backend-deployment.yaml
              sh """
                sed -i 's#image: saisamarth21/lms-backend:.*#image: ${beTag}#' \
                  K8s-lms-site/backend-deployment.yaml
              """

              // Commit & push changes
              sh """
                git config user.email "jenkins@your.domain"
                git config user.name  "Jenkins CI"
                git remote set-url origin https://${GIT_USER}:${GIT_PAT}@github.com/Saisamarth21/Kubernetes-Manifest-Files.git
                git add K8s-lms-site/frontend-deployment.yaml K8s-lms-site/backend-deployment.yaml
                git commit -m "Update images to ${feTag} & ${beTag}"
                git push origin main
              """
            }
          }
        }
      }
    }
  }
}
