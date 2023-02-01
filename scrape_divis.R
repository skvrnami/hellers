library(rvest)
library(dplyr)

convert_amount_to_numeric <- function(x){
    gsub("\\s", "", x) %>%
        gsub("CZK", "", .) %>% 
        gsub(",", ".", .) %>%
        as.numeric()
}

remove_whitespace <- function(x){
    d <- utf8ToInt(x)
    intToUtf8(d[which(d != 160)])
}

files <- list.files("data/divis/", pattern = "*.html", 
                    full.names = TRUE)

purrr::map_df(files, function(x) {
    read_html(x) %>% 
        html_node("table") %>% 
        html_table() %>% 
        janitor::clean_names() %>% 
        mutate(datum = as.Date(datum, "%d. %m. %Y"), 
               zprava = gsub("(Outgoing|Incoming) instant payment ", "", 
                             popis_transakce_zprava), 
               protistrana = if_else(grepl("Outgoing", protistrana), NA_character_, 
                                     protistrana), 
               transaction_type = stringr::str_extract(popis_transakce_zprava, 
                                                       "(Outgoing|Incoming) instant payment|(Incoming|Outgoing) payment"), 
               castka = purrr::map_dbl(castka, ~convert_amount_to_numeric(remove_whitespace(.x))), 
               konstantni_symbol = stringr::str_extract(detail_transakce, "(?<=Konstantní symbol: )[0-9]+"), 
               variabilni_symbol = stringr::str_extract(detail_transakce, "(?<=Variabilní symbol: )[0-9]+")
        ) %>% 
        select(-c(popis_transakce_zprava, detail_transakce))
}) -> divis_final

saveRDS(divis_final, "output/divis/donations_final.rds")
write.csv(divis_final, "output/divis/donations_final.csv", row.names = FALSE)
