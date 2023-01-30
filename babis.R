library(rvest)
library(dplyr)

source("src/funs.R")

recode_date <- function(x){
    d <- utf8ToInt(x)
    as.Date(intToUtf8(d[which(d != 160)]), format = "%d.%m.%Y")
}

extract_message <- function(x){
    end_char <- stringr::str_locate(x, "platba")[2]
    if(!is.na(end_char)){
        substr(x, end_char + 1, nchar(x))    
    }else{
        NA_character_
    }
}

delete_whitespace <- function(x){
    d <- utf8ToInt(x)
    intToUtf8(d[which(d != 160)])
}

babis_df <- read_html("data/babis_final.html") %>% 
    html_node(".table-wrapper") %>% 
    html_table() %>% 
    janitor::clean_names() %>% 
    mutate(
        datum = lubridate::as_date(purrr::map_dbl(datum, ~recode_date(.x))),
        protistrana = stringr::str_extract(protistrana_popis_transakce, "[A-Ža-ž., ]+Příchozí") %>% 
            gsub("Příchozí", "", .), 
        message = purrr::map_chr(protistrana_popis_transakce, ~extract_message(.x)), 
        transfer_czk = convert_amount_to_numeric(purrr::map_chr(pripsano_odepsano_v_mene_uctu, delete_whitespace)), 
        symboly = purrr::map(variabilni_konstantni_specificky_symbol, ~as.numeric(stringr::str_trim(unlist(strsplit(.x, "/"))))), 
        variabilni_symbol = purrr::map_dbl(symboly, function(x) x[1]), 
        konstantni_symbol = purrr::map_dbl(symboly, function(x) x[2]), 
        specificky_symbol = purrr::map_dbl(symboly, function(x) x[3])
    ) %>% 
    select(datum, variabilni_symbol, konstantni_symbol, specificky_symbol, transfer_czk, 
           protistrana, message) 

saveRDS(babis_df, "babis_final.rds")
write.csv(babis_df, "babis_final.csv")
