csv_files <- list.files("output/", pattern = "ano-transfers-4070217*", 
                        full.names = TRUE)

read_transfers <- function(path){
    read.csv(path, 
             header = FALSE, 
             sep = ";", 
             quote = "")
}

# read_transfers2 <- function(path){
#     readr::read_delim(path, 
#                       delim = ";", 
#                       col_names = FALSE, 
#                       quote = "")
# }

lines1 <- readLines(csv_files[1])
lines2 <- readLines(csv_files[2])

# lines1_fixed <- gsub("Odchozí platba", "Odchozí platba;", lines1)
# writeLines(lines1_fixed, "output/lines1_fixed.csv")
# View(read_transfers2("output/lines1_fixed.csv"))

file1 <- read_transfers2(csv_files[1])
file2 <- read_transfers2(csv_files[2])


set.seed(1)

find_surrounding <- function(lines1, lines2, surrounding_size = 5){
    sampled_line <- sample(lines1, 1)
    sampled_line_no <- which(sampled_line == lines1)[1]
    cat(sampled_line_no, "\n")
    surrounding <- (sampled_line_no - surrounding_size):(sampled_line_no + surrounding_size)
    selected_lines1 <- lines1[c(surrounding)]
    
    purrr::map(1:(surrounding_size * 2), ~which(selected_lines1[.] == lines2))
}

find_surrounding(lines1, lines2, 5)
