library(dplyr)

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
                    "ZNOJMOPROJEKT ING. A") ~ TRUE, 
        TRUE ~ FALSE
    ))

# extract titles
persons <- final_data %>% 
    filter(!is_company) %>%
    filter(type == "Příchozí platba") %>%
    mutate(name = ifelse(name == "?t?pán ?vácha", "Štěpán Švácha", name)) %>%
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
               stringr::str_trim(., "both")
           )

table(persons$titles)

companies <- final_data %>%
    filter(is_company)

# title case?
# asciify?

# first vs. last name