library(dplyr)
library(rvest)

TODAY <- Sys.Date()

START_DATE <- format(TODAY - 7, "%d.%m.%Y")
END_DATE <- format(TODAY - 1, "%d.%m.%Y")

pavel_url <- glue::glue("https://ib.fio.cz/ib/transparent?a=2902252345&f={START_DATE}&t={END_DATE}")

html <- read_html(pavel_url)

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

TODAY_CHR <- as.character(TODAY)
saveRDS(donations_clean, glue::glue("output/pavel/donations_{TODAY_CHR}.rds"))
    