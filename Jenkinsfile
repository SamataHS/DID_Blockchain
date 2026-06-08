pipeline {
    agent any

    environment {
        IMAGE_NAME = "samatahs/did-blockchain"
    }

    stages {

        stage('Git Version Check') {
            steps {
                bat 'git --version'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

       stage('OWASP Dependency Check') {
    steps {
        bat '''
        "C:\\tools\\dependency-check-12.2.2-release\\dependency-check\\bin\\dependency-check.bat" ^
        --project "DID-Blockchain" ^
        --scan . ^
        --format ALL ^
        --out .
        '''
    }
}

        stage('Publish OWASP Report') {
            steps {
                dependencyCheckPublisher(
                    pattern: '**/dependency-check-report.xml'
                )
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'SonarScanner'

                    withSonarQubeEnv('SonarQube') {
                        bat "\"${scannerHome}\\bin\\sonar-scanner.bat\""
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                bat 'docker build -t %IMAGE_NAME%:latest .'
            }
        }

        stage('Push Docker Image') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    bat '''
          docker login -u %DOCKER_USER% -p %DOCKER_PASS%
          docker push %IMAGE_NAME%:latest
'''
                }
            }
        }

        stage('Deploy Container') {
            steps {
                bat 'docker stop did-app || ver > nul'
                bat 'docker rm did-app || ver > nul'

                bat 'docker run -d --name did-app -p 3000:3000 %IMAGE_NAME%:latest'
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully'
        }

        failure {
            echo 'Pipeline failed'
        }
    }
}