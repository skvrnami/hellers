library(dplyr)

source("src/funs.R")

daily_files <- list.files("output/", pattern = "ano-transfers-4070217-2021*", 
                        full.names = TRUE)

purrr::walk(daily_files, fix_file)

daily_files_fixed <- list.files("output/", pattern = "*fixed.csv", 
                                full.names = TRUE)

total_file <- read_transfers("output/ano-transfers-4070217.csv") %>%
    mutate(date = as.Date(V1, format = "%d. %m. %Y"), 
           lagged_date = lag(date, 1), 
           jump = lagged_date > date) %>% 
    mutate(jump = ifelse(is.na(jump), FALSE, jump), 
           group = cumsum(jump))

total_file_select_days <- total_file %>%
    group_by(date, group) %>%
    summarise(n = n(), 
              n_unique = n_distinct(V6)) %>%
    group_by(date) %>%
    mutate(n_max = n == max(n)) %>%
    arrange(desc(n_max)) %>%
    mutate(n_row = row_number(), 
           to_select = n_max & n_row == 1)

total_file_df <- total_file %>%
    left_join(., total_file_select_days, by = c("date", "group")) %>%
    filter(to_select) %>% 
    select(V1:V6, path) 
    
daily_df <- purrr::map_df(daily_files_fixed, read_transfers) %>%
    bind_rows(., total_file_df)

select_days <- daily_df %>% 
    mutate(date = as.Date(V1, format = "%d. %m. %Y"), 
           downloaded_date = as.Date(stringr::str_extract(path, "[0-9]{4}-[0-9]{2}-[0-9]{2}"), 
                                     format = "%Y-%m-%d")) %>%
    group_by(date, path, downloaded_date) %>% 
    summarise(n = n(), 
              n_unique = n_distinct(V6)) %>% 
    group_by(date) %>%
    mutate(n_max = n == max(n)) %>%
    arrange(desc(n_max)) %>%
    mutate(n_row = row_number(), 
           to_select = n_max & n_row == 1, 
           diff_days = downloaded_date - date)

final_data <- daily_df %>%
    mutate(date = as.Date(V1, format = "%d. %m. %Y"), 
           amount = convert_amount_to_numeric(V2),
           downloaded_date = as.Date(stringr::str_extract(path, "[0-9]{4}-[0-9]{2}-[0-9]{2}"), 
                                     format = "%Y-%m-%d"), 
           symbols = stringr::str_extract_all(V3, "[0-9]+")) %>%
    left_join(., select_days, by = c("date", "path", "downloaded_date")) %>%
    filter(to_select) %>% 
    mutate(var_symbol = purrr::map_dbl(symbols, ~as.numeric(.[1])), 
           const_symbol = purrr::map_dbl(symbols, ~as.numeric(.[2])), 
           spec_symbol = purrr::map_dbl(symbols, ~as.numeric(.[3])), ) %>% 
    select(date, amount, var_symbol, const_symbol, spec_symbol, 
           name = V4, type = V5, message = V6)

saveRDS(final_data, "output/final_data.RData")
write.csv(final_data, "output/final_data.csv", row.names = FALSE)
