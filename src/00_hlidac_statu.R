library(dplyr)
library(hlidacr)

# Download transaction records from Hlidac statu API
ano_transactions <- get_dataset_data("transparentni-ucty-transakce", 
                                     query = "CisloUctu.keyword:4070217/0100")

max_page <- ceiling(ano_transactions$Total / nrow(ano_transactions$Results))
n_pages <- min(c(200, max_page))
ano_transactions_all <- vector("list", n_pages)
               
for(i in 1:n_pages){
    cat(i, "\n")
    Sys.sleep(1)
    tmp <- get_dataset_data("transparentni-ucty-transakce", 
                            query = "CisloUctu.keyword:4070217/0100", 
                            sort = "Datum",
                            desc = 1,
                            page = i)
    ano_transactions_all[[i]] <- tmp
}

ano_transactions_all_desc <- purrr::map_df(ano_transactions_all, function(x) x$Results)

ano_transactions_asc <- vector("list", n_pages)
for(i in 1:n_pages){
    cat(i, "\n")
    Sys.sleep(1)
    tmp <- get_dataset_data("transparentni-ucty-transakce", 
                            query = "CisloUctu.keyword:4070217/0100", 
                            sort = "Datum",
                            desc = 0,
                            page = i)
    ano_transactions_asc[[i]] <- tmp
}

ano_transactions_all_asc <- purrr::map_df(ano_transactions_asc, function(x) x$Results)

asc_max_date <- max(ano_transactions_all_asc$Datum)
transactions_asc <- ano_transactions_all_asc %>%
    filter(Datum < asc_max_date)
transactions_desc <- ano_transactions_all_desc %>%
    filter(Datum >= asc_max_date)

transactions_all <- bind_rows(transactions_asc, transactions_desc)

stopifnot(ano_transactions$Total == nrow(transactions_all))

saveRDS(transactions_all, "output/ano_hlidac_transactions.RData")
