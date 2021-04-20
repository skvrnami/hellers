library(dplyr)
library(ggplot2)

source("src/funs.R")

ano_general_account <- readRDS("output/final_data.RData")

heller_transactions <- ano_general_account %>% 
    filter(type == "Příchozí platba") %>% 
    filter(amount > 0 & amount < 10) %>% 
    count(date)

data.frame(
    date = seq.Date(from = min(heller_transactions$date), 
                    to = max(heller_transactions$date), 
                    by = 1)
) -> all_dates

heller_transactions_all_dates <- left_join(
    all_dates, heller_transactions, by = "date") %>%
    mutate(n = ifelse(is.na(n), 0, n))

ggplot(heller_transactions_all_dates %>%
           filter(date >= "2021-01-01"), aes(x = date, y = n)) + 
    geom_line() + 
    geom_point() + 
    theme_minimal()

ggsave("output/hellers_chart.png")
