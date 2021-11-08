.PHONY: local
local:
	docker build -t backend -f docker/Dockerfile .
	docker run -p 5000:5000 -d backend

#download_logos:



#test:
