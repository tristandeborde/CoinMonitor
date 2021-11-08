.PHONY: local_build
local_build_%:
	docker build -t backend -f docker/Dockerfile .
	docker rm -f backend_$*
	docker run -p 5000:5000 --name=backend_$* -d backend -c "npm run $*"

local_test_%:
	docker exec -it backend_$* bash -c "cd /usr/local/backend && npm run test"

#download_logos:
