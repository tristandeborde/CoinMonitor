.PHONY: local
local:
	docker build -t backend -f docker/Dockerfile .
	docker rm -f backend
	docker run -p 5000:5000 --name=backend -d backend

#download_logos:



#test:
