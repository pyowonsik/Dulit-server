pipeline {
    agent any
    
    triggers {
        githubPush()  // GitHub Push 이벤트를 받을 때 트리거
    }

    environment {
        GIT_REPO = 'https://github.com/pyowonsik/Dulit-server'
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    // 기존 'Dulit-server' 디렉토리가 있으면 삭제
                    sh 'rm -rf Dulit-server || true'

                    // GitHub에서 최신 코드 클론
                    withCredentials([usernamePassword(credentialsId: 'jenkins_ssh_token', usernameVariable: 'GIT_USER', passwordVariable: 'GIT_TOKEN')]) {
                        sh "git clone https://$GIT_USER:$GIT_TOKEN@github.com/pyowonsik/Dulit-server"
                    }
                }
            }
        }
    }

    post {
        success {
            echo '🚀 GitHub repository cloned successfully!'
        }
        failure {
            echo '❌ Failed to clone the repository!'
        }
    }
}
