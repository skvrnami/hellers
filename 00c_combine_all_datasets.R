
source("src/funs.R")

ano1_scraped <- readRDS("output/final_data_4070217.RData")
ano1_manual <- read.csv("output/ano_4070217_manual.csv") %>% 
    mutate(date = as.Date(stringr::str_replace_all(date, "\\s", " "), 
                          format = "%d. %m. %Y"), 
           amount = convert_to_numeric(amount), 
           symbols = stringr::str_extract_all(symbols, "[0-9]+"), 
           var_symbol = purrr::map_dbl(symbols, ~as.numeric(.[1])), 
           const_symbol = purrr::map_dbl(symbols, ~as.numeric(.[2])), 
           spec_symbol = purrr::map_dbl(symbols, ~as.numeric(.[3]))) %>% 
    select(-symbols) %>% 
    rename(type = payment)

ano1_final <- bind_rows(ano1_scraped, 
          ano1_manual %>% filter(date > min(ano1_scraped$date))) %>% 
    arrange(date)

write.csv(ano1_final, "output/ano_4070217_final.csv", 
          row.names = FALSE)

ano2_scraped <- readRDS("output/final_data_4090453.RData")
ano2_manual <- read.csv("output/ano_4090453_manual.csv") %>% 
    mutate(date = as.Date(stringr::str_replace_all(date, "\\s", " "), 
                          format = "%d. %m. %Y"), 
           amount = convert_to_numeric(amount), 
           symbols = stringr::str_extract_all(symbols, "[0-9]+"), 
           var_symbol = purrr::map_dbl(symbols, ~as.numeric(.[1])), 
           const_symbol = purrr::map_dbl(symbols, ~as.numeric(.[2])), 
           spec_symbol = purrr::map_dbl(symbols, ~as.numeric(.[3]))) %>% 
    select(-symbols) %>% 
    rename(type = payment)

ano2_final <- bind_rows(ano2_scraped, 
                        ano2_manual %>% filter(date > min(ano1_scraped$date))) %>% 
    arrange(date)

write.csv(ano2_final, "output/ano_4090453_final.csv", 
          row.names = FALSE)

