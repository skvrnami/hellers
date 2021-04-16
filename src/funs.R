convert_amount_to_numeric <- function(x){
    gsub("\\s", "", x) %>%
        gsub("CZK", "", .) %>%
        gsub(",", ".", .) %>%
        as.numeric()
}

read_transfers <- function(path){
    read.csv(path, 
             header = FALSE, 
             sep = ";", 
             quote = "") %>%
        mutate(path = path)
}

fix_file <- function(path){
    lines <- readLines(path)
    lines_fixed <- gsub("Odchozí platba", ";Odchozí platba", lines)
    writeLines(lines_fixed, gsub(".csv", "-fixed.csv", path))
}
