.PHONY: all
all: ci bundle install

.PHONY: ci
ci: 
	@npm ci

.PHONY: bundle
bundle:
	@npm run bundle

.PHONY: install
install:
	@npm install

.PHONY: updateV1
updateV1:
	@git checkout main
	@git tag -f v1
	@git push -f origin v1