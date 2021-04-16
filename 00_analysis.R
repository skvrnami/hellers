library(dplyr)
library(ggplot2)

source("src/funs.R")

ano_general_account <- readRDS("output/final_data.RData")

heller_transactions <- ano_general_account %>% 
    filter(type == "Příchozí platba") %>% 
    filter(amount > 0 & amount < 10) %>% 
    count(date)

ggplot(heller_transactions, aes(x = date, y = n)) + 
    geom_line() + 
    geom_point() + 
    scale_y_sqrt() + 
    theme_minimal()
