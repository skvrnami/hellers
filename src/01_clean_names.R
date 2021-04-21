library(dplyr)

# TODO: asciify names?

final_data <- readRDS("output/final_data.RData") %>%
    mutate(is_company = case_when(
        grepl("a\\.s\\.", name, ignore.case = TRUE) ~ TRUE, 
        grepl("s\\.r\\.o", name, ignore.case = TRUE) ~ TRUE,
        grepl("s\\.r", name, ignore.case = TRUE) ~ TRUE,
        grepl("s r\\.o\\.", name, ignore.case = TRUE) ~ TRUE,
        grepl("spol\\.", name, ignore.case = TRUE) ~ TRUE,
        grepl("s\\.p\\.", name, ignore.case = TRUE) ~ TRUE,
        name %in% c("Vitesse PSP B.V. - C", 
                    "FIRMA A.TVRDIK-ZALOZ",
                    "JSS TANDEM KARL.VARY", 
                    "TIPA Telekom plus a.", 
                    "VINAŘSTVÍ ZIKMUND s.",
                    "ZNOJMOPROJEKT ING. A", 
                    "Advokátní kancelář F", 
                    "BRANO", 
                    "BICISTE-ZAMECTNICTVI", 
                    "PSKON", "MF") ~ TRUE, 
        TRUE ~ FALSE
    ))

# extract titles
persons <- final_data %>% 
    filter(!is_company) %>%
    filter(type == "Příchozí platba") %>%
    mutate(name = case_when(name == "?t?pán ?vácha" ~ "Štěpán Švácha", 
                            name == "Mazáček JaroslavIng" ~ "Mazáček Jaroslav",
                            TRUE ~ name)) %>%
    mutate(titles = stringr::str_extract(name, "([A-Za-z]+\\.[ ]*)+")) %>% 
    mutate(titles = case_when(
        titles %in% c("A.", "B. ", "J.", 
                      "Ku. ", "M.", "ml.", 
                      "T. ") ~ NA_character_, 
        titles == "JAR. ING." ~ "ING.", 
        titles == "MUDr. Hel. " ~ "MUDr.",
        TRUE ~ titles
    )) %>% 
    mutate(name_clean = purrr::map2_chr(name, titles, 
                                        function(x, y) if(!is.na(y)) {
                                            gsub(y, "", x)
                                        }else{
                                            x
                                        }) %>%
               gsub(",", "", .) %>%
               stringr::str_trim(., "both"), 
           titles = stringr::str_trim(titles, "both"))

table(persons$titles)

find_name_probability <- function(name){
    tmp <- listr:::names_division %>%
        filter(name == !!name)
    if(nrow(tmp)){
        tmp$prob_first_name
    }else{
        0.5
    }
}

names_map <- data.frame(
    name = persons %>% 
        pull(name_clean) %>%
        unique
) %>%
    mutate(full_name = stringr::str_to_title(name, locale = "cs"), 
           full_name_list = strsplit(full_name, " "), 
           first_name_prob = purrr::map(full_name_list, 
                                        ~purrr::map_dbl(.x, find_name_probability))
           ) %>%
    mutate(names_length = purrr::map_int(full_name_list, length)) %>% 
    mutate(first_name = purrr::pmap_chr(list(full_name_list, first_name_prob, names_length), 
                                        function(name, p, l){
        if(l == 2){
            paste0(name[which.max(p)], collapse = " ")
        }else if(l > 2){
            paste0(name[p > 0.5], collapse = " ")
        }else{
            NA_character_
        }
    }), 
    last_name = purrr::pmap_chr(list(full_name_list, first_name_prob, names_length), 
                            function(name, p, l){
                                if(l == 2){
                                    paste0(name[which.min(p)], collapse = " ")
                                }else if(l > 2){
                                    paste0(name[p < 0.5], collapse = " ")
                                }else{
                                    NA_character_
                                }
                            })
    )

persons_clean <- persons %>%
    left_join(., names_map %>% select(name, names_length, first_name, last_name), 
              by = c("name_clean"="name"))

companies <- final_data %>%
    filter(is_company) %>%
    filter(type == "Příchozí platba")

incoming_payments <- bind_rows(persons_clean, companies)

saveRDS(incoming_payments, "output/incoming_payments.RData")
write.csv(incoming_payments, "output/incoming_payments.csv", 
          row.names = FALSE, na = "")
