library(dplyr)
library(rvest)

parse_tr <- function(x){
    tds <- html_nodes(x, "td")
    message <- tds[4] %>% 
        html_text2() %>% 
        strsplit(., "\n") %>% 
        unlist()
    
    if(length(message) == 3){
        tibble(
            date = html_text(tds[1]),
            amount = html_text(tds[2]), 
            symbols = html_text(tds[3]), 
            name = message[1], 
            payment = message[2], 
            message = message[3]
        )
    }else{
        tibble(
            date = html_text(tds[1]),
            amount = html_text(tds[2]), 
            symbols = html_text(tds[3]), 
            name = NA_character_, 
            payment = message[1], 
            message = message[2]
        )
    }
}

ano1_html <- read_html("webpages/4070217.html")
ano_transactions1 <- ano1_html %>% 
    html_node(".table-wrapper") %>% 
    html_nodes("tr")

ano_transactions1[[1]] <- NULL
ano_transactions1_parsed <- purrr::map_df(ano_transactions1, parse_tr)

ano2_html <- read_html("webpages/4090453.html")
ano_transactions2 <- ano2_html %>% 
    html_node(".table-wrapper") %>% 
    html_nodes("tr")

ano_transactions2[[1]] <- NULL
ano_transactions2_parsed <- purrr::map_df(ano_transactions2, parse_tr)

write.csv(ano_transactions1_parsed, "output/ano_4070217_manual.csv", 
          row.names = FALSE)
write.csv(ano_transactions2_parsed, "output/ano_4090453_manual.csv", 
          row.names = FALSE)
