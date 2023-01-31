
pavel_files <- list.files("output/pavel", pattern = "*.rds", full.names = TRUE)

pavel_final <- purrr::map_df(pavel_files, readRDS)

saveRDS(pavel_final, "output/pavel/donations_final.rds")
write.csv(pavel_final, "output/pavel/donations_final.csv", 
          row.names = FALSE)
