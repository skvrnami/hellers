library(dplyr)
library(ggplot2)

source("src/funs.R")

last_final_dataset <- tail(list.files("output", "incoming_payments_[0-9-]+.RData", full.names = TRUE), 1)
ano_donations <- readRDS(last_final_dataset)

heller_donors <- ano_donations %>% 
    filter(type == "Příchozí platba") %>% 
    filter(amount > 0 & amount < 10) %>% 
    group_by(name) %>%
    arrange(date) %>%
    summarise(first_donation = head(date, 1),
              first_amount = head(amount, 1),
              first_message = head(message, 1))

write.csv(heller_donors, file = "output/heller_donors.csv", 
          row.names = FALSE)

heller_transactions <- ano_donations %>% 
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
    theme_minimal() + 
    labs(x = "Datum", y = "Počet halířových darů")

ggsave("output/hellers_chart.png")

heller_donors %>% 
    count(first_donation) %>% 
    filter(first_donation >= "2021-01-01") %>%
    ggplot(., aes(x = first_donation, y = n)) + 
    geom_bar(stat = "identity") + 
    theme_minimal() + 
    labs(x = "Datum", y = "Počet nových dárců posílajících halířové dary", 
         caption = "Poznámka: Pouze noví dárci za rok 2021")

ggsave("output/heller_donors.png")
    
