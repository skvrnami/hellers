library(dplyr)
library(ggplot2)

source("src/funs.R")

ano_general_account <- read.csv("output/ano-transfers-4070217.csv", 
                                header = FALSE, 
                                sep = ";", 
                                quote = "")

heller_transactions <- ano_general_account %>%
    rename(date = V1, 
           amount = V2, 
           symbols = V3, 
           person = V4, 
           type = V5, 
           message = V6) %>% 
    filter(type == "Příchozí platba") %>%
    mutate(amount = convert_amount_to_numeric(amount), 
           date = as.Date(date, format = "%d. %m. %Y")) %>%
    filter(amount > 0 & amount < 10) %>% 
    count(date)

ggplot(heller_transactions, aes(x = date, y = n)) + 
    geom_line() + 
    geom_point() + 
    scale_y_sqrt() + 
    theme_minimal()
