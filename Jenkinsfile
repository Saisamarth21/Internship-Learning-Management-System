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
            docker.build(feTag, ".")
          }

          dir('backend') {
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

          sh """
            trivy --severity HIGH,CRITICAL --no-progress \
              image --format table \
              --output trivy-frontend-report.txt \
              ${feTag}
          """
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
            docker.image(feTag).push()
            docker.image(beTag).push()
          }
        }
      }
    }

    stage('Update Kubernetes Manifests') {
      when { expression { currentBuild.currentResult == 'SUCCESS' } }
      steps {
        withCredentials([usernamePassword(credentialsId: 'GithubCred', usernameVariable: 'GIT_USER', passwordVariable: 'GIT_PAT')]) {
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

            def feTag = "saisamarth21/lms-frontend:1.0.${env.BUILD_NUMBER}"
            def beTag = "saisamarth21/lms-backend:1.0.${env.BUILD_NUMBER}"

            sh """
              sed -i 's#image: saisamarth21/lms-frontend:.*#image: ${feTag}#' \
                K8s-lms-site/frontend-deployment.yaml
            """
            sh """
              sed -i 's#image: saisamarth21/lms-backend:.*#image: ${beTag}#' \
                K8s-lms-site/backend-deployment.yaml
            """

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

    stage('Cleanup') {
      when { expression { currentBuild.currentResult == 'SUCCESS' } }
      steps {
        script {
          def feTag = "saisamarth21/lms-frontend:1.0.${env.BUILD_NUMBER}"
          def beTag = "saisamarth21/lms-backend:1.0.${env.BUILD_NUMBER}"

          sh "docker rmi ${feTag} || true"
          sh "docker rmi ${beTag} || true"
        }
      }
    }
  }

  post {
    success {
      emailext(
        attachLog: true,
        attachmentsPattern: '''
          dependency-check-report/*.html,
          dependency-check-report/*.xml,
          trivy-frontend-report.txt,
          trivy-backend-report.txt''',
        from:    'saisamarthu@gmail.com',
        to:      'saisamarthu@gmail.com',
        subject: "✅ Build #${env.BUILD_NUMBER} of ${env.JOB_NAME} Succeeded",
        mimeType: 'text/html',
        body: """
          <h2 style='color:green;'>Build Succeeded!</h2>
          <p><strong>Project:</strong> ${env.JOB_NAME}</p>
          <p><strong>Build Number:</strong> ${env.BUILD_NUMBER}</p>
          <p><strong>Frontend URL:</strong> <a href="http://129.154.250.255:5173/">http://129.154.250.255:5173/</a></p>
          <p><strong>API URL:</strong> <a href="http://129.154.250.255:4000/">http://129.154.250.255:4000/</a></p>
          <p><strong>MongoDB UI:</strong> <a href="http://129.154.250.255:8081/">http://129.154.250.255:8081/</a></p>
          <p><strong>Code Repo:</strong> <a href="https://github.com/Saisamarth21/Internship-Learning-Management-System">https://github.com/Saisamarth21/Internship-Learning-Management-System</a></p>
          <p><strong>Manifests Repo:</strong> <a href="https://github.com/Saisamarth21/Kubernetes-Manifest-Files">https://github.com/Saisamarth21/Kubernetes-Manifest-Files</a></p>
        """
      )
    }
    failure {
      emailext(
        attachLog: true,
        attachmentsPattern: '''
          dependency-check-report/*.html,
          dependency-check-report/*.xml,
          trivy-frontend-report.txt,
          trivy-backend-report.txt''',
        from:    'saisamarthu@gmail.com',
        to:      'saisamarthu@gmail.com',
        subject: "❌ Build #${env.BUILD_NUMBER} of ${env.JOB_NAME} Failed",
        mimeType: 'text/html',
        body: """
          <h2 style='color:red;'>Build Failed!</h2>
          <p><strong>Project:</strong> ${env.JOB_NAME}</p>
          <p><strong>Build Number:</strong> ${env.BUILD_NUMBER}</p>
          <p>Please review the console output, reports, and logs for details.</p>
          <p><strong>Frontend URL:</strong> <a href="http://129.154.250.255:5173/">http://129.154.250.255:5173/</a></p>
          <p><strong>API URL:</strong> <a href="http://129.154.250.255:4000/">http://129.154.250.255:4000/</a></p>
          <p><strong>MongoDB UI:</strong> <a href="http://129.154.250.255:8081/">http://129.154.250.255:8081/</a></p>
          <p><strong>Code Repo:</strong> <a href="https://github.com/Saisamarth21/Internship-Learning-Management-System">https://github.com/Saisamarth21/Internship-Learning-Management-System</a></p>
          <p><strong>Manifests Repo:</strong> <a href="https://github.com/Saisamarth21/Kubernetes-Manifest-Files">https://github.com/Saisamarth21/Kubernetes-Manifest-Files</a></p>
        """
      )
    }
  }
}
