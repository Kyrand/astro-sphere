# Display the last 100 lines of development log with ANSI codes stripped
# Start development environment with live reloading
dev:
	./scripts/shoreman.sh

tail-log:
	@tail -100 ./.log/challmar.log | perl -pe 's/\e\[[0-9;]*m(?:\e\[K)?//g'


