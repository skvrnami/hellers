library(dplyr)

source("src/funs.R")

args <- commandArgs(trailingOnly = TRUE)

if(length(args) == 0){
    stop("At least one argument must be supplied.", call. = FALSE)
}else{
    if(!args[1] %in% c("4070217", "4090453")){
        stop("Unrecognized account number.", call. = FALSE)
    }
}
# 4070217
# 4090453
ANO_ACCOUNT <- "4090453" # args[1]

daily_files <- list.files("output/", pattern = glue::glue("ano-transfers-{ANO_ACCOUNT}-2021*"), 
                        full.names = TRUE)

purrr::walk(daily_files, fix_file)

daily_files_fixed <- list.files("output/", pattern = "*fixed.csv", 
                                full.names = TRUE)

total_file <- read_transfers(glue::glue("output/ano-transfers-{ANO_ACCOUNT}.csv")) %>%
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
    select(V1:V6, path) %>%
    mutate(V6 = ifelse(V4 %in% c("Odchozí platba", "Vklad", 
                                 "Odchozí zahraniční platba", "Ostatní služby", 
                                 "Poplatek"), 
                       V5, V6), 
           V5 = ifelse(V4 %in% c("Odchozí platba", "Vklad", 
                                 "Odchozí zahraniční platba", "Ostatní služby", 
                                 "Poplatek"), 
                       V4, V5), 
           V4 = ifelse(V4 %in% c("Odchozí platba", "Vklad", 
                                 "Odchozí zahraniční platba", "Ostatní služby", 
                                 "Poplatek"), 
                       "", V4) 
           )
    
daily_df <- purrr::map_df(daily_files_fixed, read_transfers) %>%
    bind_rows(., total_file_df)

select_days <- daily_df %>% 
    mutate(date = as.Date(stringr::str_replace_all(V1, "\\s", " "), format = "%d. %m. %Y"), 
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
    mutate(date = as.Date(stringr::str_replace_all(V1, "\\s", " "), format = "%d. %m. %Y"), 
           amount = convert_to_numeric(V2),
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

system("rm output/*-fixed.csv")

if(ANO_ACCOUNT == "4070217"){
    hlidac_transactions <- readRDS("output/ano_hlidac_transactions.RData") %>%
        mutate(Zprava = ifelse(is.na(Zprava), ZpravaProPrijemce, Zprava), 
               date = as.Date(Datum, format = "%Y-%m-%dT%H:%M:%S")) %>%
        select(-c(ZpravaProPrijemce, DbCreated, DbCreatedBy, AddId, ZdrojUrl)) %>%
        rename(var_symbol = VS, 
               const_symbol = KS, 
               spec_symbol = SS, 
               amount = Castka, 
               message = Zprava, 
               name = NazevProtiuctu, 
               type = PopisTransakce) %>%
        mutate(var_symbol = ifelse(var_symbol %in% c("–", ""), 0, as.numeric(var_symbol)), 
               const_symbol = ifelse(const_symbol %in% c("–", ""), 0, as.numeric(const_symbol)), 
               spec_symbol = ifelse(spec_symbol %in% c("–", ""), 0, as.numeric(spec_symbol)), 
               type = ifelse(amount < 0, "Odchozí platba", "Příchozí platba")) %>%
        select(date, amount, var_symbol, const_symbol, spec_symbol, 
               name, type, message)
    
    kb_min_date <- min(final_data$date, na.rm = TRUE)
    
    
    hlidac_transactions %>%
        filter(date == kb_min_date)
    
    final_data %>%
        filter(date == kb_min_date)
    
    final_data_with_hlidac <- bind_rows(
        hlidac_transactions %>% filter(date <= kb_min_date), 
        final_data %>% filter(date > kb_min_date)
    )
    
    saveRDS(final_data_with_hlidac, glue::glue("output/final_data_{ANO_ACCOUNT}.RData"))
    write.csv(final_data_with_hlidac, glue::glue("output/final_data_{ANO_ACCOUNT}.csv"), row.names = FALSE)
    
}else{
    saveRDS(final_data, glue::glue("output/final_data_{ANO_ACCOUNT}.RData"))
    write.csv(final_data, glue::glue("output/final_data_{ANO_ACCOUNT}.csv"), row.names = FALSE)
}
