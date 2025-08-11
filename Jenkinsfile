pipeline {
    agent any

    triggers {
        githubPush()  // GitHub Push 이벤트 트리거
    }

    environment {
        GIT_REPO = 'git@github.com:pyowonsik/Dulit-server.git'  // SSH 방식
        GITHUB_API_TOKEN = credentials('jenkins_ssh_token')  // Jenkins에 설정된 GitHub API 토큰을 가져오기
        SSH_KEY = '/var/jenkins_home/.ssh/id_rsa'  // Jenkins 서버에서 id_rsa 키 경로 설정
        EC2_USER = 'ubuntu'                       // EC2 사용자명
        EC2_HOST = '54.180.97.150'                // EC2 IP 주소
        DOCKER_COMPOSE_DIR = '/home/ubuntu/Dulit-server'  // EC2에서 실행 중인 docker-compose.yml 위치
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    // 기존 'Dulit-server' 디렉토리 삭제 (에러 방지)
                    sh 'rm -rf Dulit-server || true'

                    // GitHub에서 최신 코드 클론 (SSH 방식)
                    withCredentials([sshUserPrivateKey(credentialsId: 'jenkins_ssh_key', keyFileVariable: 'SSH_KEY')]) {
                        sh '''
                            eval "$(ssh-agent -s)"  # SSH 에이전트 시작
                            ssh-add $SSH_KEY  # SSH 키 추가

                            # GitHub에서 클론
                            git clone $GIT_REPO
                        '''
                    }
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                script {
                    // .git 디렉토리 제외하고 tar로 압축한 후 EC2 서버로 복사
                    sh '''
                        tar --exclude='.git' -czf Dulit-server.tar.gz Dulit-server/
                        scp -i ${SSH_KEY} -o StrictHostKeyChecking=no Dulit-server.tar.gz ${EC2_USER}@${EC2_HOST}:/home/ubuntu/
                    '''
                    
                    // EC2 서버에서 tar 파일 압축 풀기 후 도커 명령어 실행
                    sh """
                        ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} '
                            cd /home/ubuntu && 
                            tar -xvzf Dulit-server.tar.gz && 
                            rm Dulit-server.tar.gz && 
                            cd Dulit-server &&

                            # Git으로 최신 코드 pull
                            git fetch origin
                            git reset --hard origin/main
                            git clean -fd

                            # 도커 명령어 실행
                            docker-compose stop dulit nginx && 
                            docker-compose up -d dulit nginx
                            echo "Current Directory: \$(pwd)"  # 현재 작업 디렉토리 출력
                        '
                    """
                }
            }
        }
    }

    post {
        success {
            echo '🚀 Code cloned and deployed successfully to EC2!'
        }
        failure {
            echo '❌ Pipeline failed. Check the logs for more details.'
        }
    }
}
