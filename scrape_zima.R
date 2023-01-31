library(dplyr)
library(rvest)

convert_amount_to_numeric <- function(x){
    gsub("\\s", "", x) %>%
        gsub("EUR", "", .) %>% 
        gsub("Kč", "", .) %>%
        gsub(",", ".", .) %>%
        as.numeric()
}

zima <- read_html("data/zima_final.html")
table <- zima %>% 
    html_element("table") 

text <- table %>% 
    html_nodes("tr") %>% 
    html_nodes("td") %>% 
    purrr::keep(., function(x) html_attr(x, "data-title") == "Název účtu,Poznámka") %>% 
    html_text2()

text1 <- purrr::map_chr(text, ~unlist(strsplit(.x, "\\n"))[1])
text2 <- purrr::map_chr(text, ~unlist(strsplit(.x, "\\n"))[2])

donations_clean <- table %>% 
    html_table() %>% 
    slice(2:nrow(.)) %>% 
    janitor::clean_names() %>% 
    mutate(nazev_uctu = text1, 
           poznamka = text2) %>% 
    select(-nazev_uctu_poznamka) %>% 
    mutate(datum = as.Date(datum, "%d. %m. %Y"), 
           currency = stringr::str_extract(castka, "Kč|EUR"), 
           castka = convert_amount_to_numeric(castka)) 

saveRDS(donations_clean, "output/zima/donations_all.rds")
write.csv(donations_clean, "output/zima/donations_all.csv", row.names = FALSE)
