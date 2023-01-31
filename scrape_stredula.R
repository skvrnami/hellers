library(dplyr)
library(rvest)

stredula_url <- "https://ib.fio.cz/ib/transparent?a=2602250487&f=31.01.2022&t=31.01.2023"

html <- read_html(stredula_url)

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

saveRDS(donations_clean, "output/stredula/donations_all.rds")
write.csv(donations_clean, "output/stredula/donations_all.csv", row.names = FALSE)
