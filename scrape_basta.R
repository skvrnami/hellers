library(dplyr)
library(rvest)

basta_url <- "https://ib.fio.cz/ib/transparent?a=2702310803&f=31.01.2022&t=31.01.2023"

html <- read_html(basta_url)

donations <- html %>% 
    html_table() %>% 
    purrr::pluck(2)

convert_to_num <- function(x){
    stringr::str_remove(x, "\\s") %>% 
        stringr::str_replace(., ",", ".") %>% 
        stringr::str_extract(., "[-]*[0-9.]+") %>% 
        as.numeric()
}

donations_clean <- donations %>% 
    janitor::clean_names() %>% 
    mutate(
        datum = as.Date(datum, format = "%d.%m.%Y"),
        mena = stringr::str_extract(castka, "[A-Z]+"),
        castka = convert_to_num(castka), 
    )

saveRDS(donations_clean, "output/basta/donations_all.rds")
write.csv(donations_clean, "output/basta/donations_all.csv", row.names = FALSE)
