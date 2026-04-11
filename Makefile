PARSER_SRC  = src/parser.c
PARSER_INC  = src
OUTPUT_DIR  = parser
OUTPUT      = $(OUTPUT_DIR)/slippers.so

CC      ?= cc
CFLAGS  = -shared -fPIC -Os

UNAME := $(shell uname)
ifeq ($(UNAME), Darwin)
  CFLAGS += -undefined dynamic_lookup
endif

.PHONY: all clean

all: $(OUTPUT)

$(OUTPUT): $(PARSER_SRC)
	mkdir -p $(OUTPUT_DIR)
	$(CC) $(CFLAGS) -o $(OUTPUT) $(PARSER_SRC) -I$(PARSER_INC)

clean:
	rm -f $(OUTPUT)
