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
                dependencyCheck additionalArguments: '--scan .',
                                odcInstallation: 'OWASP-DC'
            }
        }

        stage('Publish OWASP Report') {
            steps {
                dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    bat 'sonar-scanner'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                bat 'docker build -t %IMAGE_NAME% .'
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
                    echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin
                    docker push %IMAGE_NAME%
                    '''
                }
            }
        }

        stage('Deploy Container') {
            steps {
                bat '''
                docker stop did-app || exit 0
                docker rm did-app || exit 0

                docker run -d --name did-app -p 3000:3000 %IMAGE_NAME%
                '''
            }
        }
    }
}