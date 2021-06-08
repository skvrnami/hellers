library(dplyr)

# TODO: asciify names?
# TODO: determine if a name belongs to person/company based on what?
# 1) no part of the name is in the names list by Ministry of Interior
# 2) ask ARES whether the entity is company

final_files_df <- list.files("output", "final_data_[0-9]+.RData", full.names = TRUE) %>%
    purrr::map_df(., function(x) readRDS(x) %>%
                  mutate(account_number = stringr::str_extract(x, "[0-9]+")))

final_data <- final_files_df %>%
        mutate(is_company = case_when(
        grepl("a\\.s\\.", name, ignore.case = TRUE) ~ TRUE, 
        grepl("a\\.s", name, ignore.case = TRUE) ~ TRUE, 
        grepl("s\\.r\\.o", name, ignore.case = TRUE) ~ TRUE,
        grepl("s\\.r", name, ignore.case = TRUE) ~ TRUE,
        grepl("s r\\.o\\.", name, ignore.case = TRUE) ~ TRUE,
        grepl("s\\. r\\. o\\.", name, ignore.case = TRUE) ~ TRUE,
        grepl("spol\\.", name, ignore.case = TRUE) ~ TRUE,
        grepl("s\\.p\\.", name, ignore.case = TRUE) ~ TRUE,
        grepl("v\\.o\\.s\\.", name, ignore.case = TRUE) ~ TRUE,
        grepl("z\\.s\\.", name, ignore.case = TRUE) ~ TRUE,
        grepl("o\\. s\\.", name, ignore.case = TRUE) ~ TRUE,
        grepl("velkoobchod|rekonstrukce|činnost", name, ignore.case = TRUE) ~ TRUE,
        name %in% c("Vitesse PSP B.V. - C", 
                    "FIRMA A.TVRDIK-ZALOZ",
                    "JSS TANDEM KARL.VARY", 
                    "TIPA Telekom plus a.", 
                    "VINAŘSTVÍ ZIKMUND s.",
                    "ZNOJMOPROJEKT ING. A", 
                    "Advokátní kancelář F", 
                    "BRANO", 
                    "BICISTE-ZAMECTNICTVI", 
                    "SECURITY GR.-S.G.SRO",
                    "ELTRIO SPOL S R. O.",
                    "A.P.C. - AGENTURA PARTNERS CON",
                    "D+D PARK KOSMONOSY,",
                    "D+D Park Kosmonosy a",
                    "D+D Park Pardubice a",
                    "OCEŇOVACÍ A ZNALECKÁ KANCELÁŘ",
                    "TATRA METALURGIE A",
                    "PEKAŘSTVÍ A CUKRÁŘSTVÍ JIŘÍ BL",
                    "SANATORIUM TROCNOV a",
                    "ZEMĚDĚLSKÝ PODNIK KVASICKO, A.",
                    "CAPITAL PARTNER INVESTMENT A.",
                    "Ost.z.v.k.P.ČB M.Hor",
                    "SS UMEL.A ODEV.LBC",
                    "TOP SERVIS LIBIVA S.",
                    "GOLDEN FISH HOTEL S.",
                    "STK MĚLNÍK MLADOBOLESLAVSKÁ S.",
                    "PROJECT CONTROLS, S.", 
                    "TOP DECK CATERING S.",
                    "CZECH TOP ESTATES S.",
                    "IN-CREDIT LEASING S.",
                    "CENTRUM Koupelny, s.",
                    "Střední škola tvor.a",
                    "MF CR",
                    "ETD TRANSFORMÁTORY a",
                    "LOVOCHEMIE A S",
                    "VANELLUS LIGHTNING S",
                    "ANO 2011",
                    "OKAY PLAST S R O %%%",
                    "B P R-BOHEMIA PUBLIC RELATION",
                    "AGENTURA PRO REVITAL",
                    "ŽLUVA IMPOEXPO SPOL SRO",
                    "MIKES-MIKOTRANS",
                    "NEXPRO COMMUNICATION",
                    "ELKO velkoobchod ná",
                    "AL - Market Eltronix",
                    "STAKO SPOLEČNOST S RUČENÍM OME",
                    "Účet pro provozní pl",
                    "FIRESTA-FIŠER REKONSTRUKCE S",
                    "VESELY DOPRAVNI SIGN",
                    "HSP & PARTNERS ADVOK",
                    "MLÝN PERNER SVIJAN",
                    "LOUCKOVA KOTASOVA RA",
                    "Pro femina - ambulan",
                    "VINECO - VINNÉ SKLEPY CHOMUTOV",
                    "KOPOS KOLÍN AS",
                    "SB LOGISTIK TRANSPOR",
                    "VEeEJNA INFORMACNI S",
                    "ADIV S R O",
                    "EVROPSKÁ VODNĺ DOPRA",
                    "BNP PARIBAS PERSONAL",
                    "SPA HOTEL MANAGEMENT",
                    "HOTEL AMBASSADOR ZLA",
                    "DŮM ZDRAVÍ \"U Pramen",
                    "UHRADA DO JPU",
                    "MACH - LIHNE KURAT",
                    "VG Consulting & Serv",
                    "STATUTÁRNÍ MĚSTO HRADEC KRÁLOV",
                    "BEST AGRO CZECH SE",
                    "VETERINARNI SLUZBY B",
                    "BRNO RESOLUTA INVEST",
                    "ANO 2011 - VOLEBNÍ SENÁTNÍ",
                    "Medical Science & Re",
                    "GENNOON - gynecologi",
                    "REAL HOME PARTNERS S",
                    "Pražská správa nemov",
                    "LANGER - INŽENÝRSKÁ ČINNOST S",
                    "MS JIZERA ŽELEZNÝ BROD",
                    "Renesa - stavební fi",
                    "BNP Paribas Personal",
                    "IPPS - TRANSPARENTNÍ",
                    "MENCL ELEKTRO ENGINE",
                    "VAŠE ZUBNÍ CENTRUM s",
                    "BEACHKLUB C.BUDEJOV.",
                    "PSKON", "MF") ~ TRUE, 
        TRUE ~ FALSE
    ))

# extract titles
persons <- final_data %>% 
    filter(!is_company) %>%
    filter(type == "Příchozí platba") %>%
    mutate(name = case_when(name == "?t?pán ?vácha" ~ "Štěpán Švácha", 
                            name == "Mazáček JaroslavIng" ~ "Mazáček Jaroslav Ing.",
                            name == "Masopustová Mirosla." ~ "Masopustová Miroslava",
                            TRUE ~ name)) %>%
    mutate(titles = stringr::str_extract(name, "([A-Za-z]+\\.[ ]*)+")) %>% 
    mutate(titles = case_when(
        titles %in% c("A.", "B. ", "J.", 
                      "Ku. ", "M.", "ml.", "ML.",
                      "T. ", "sen.") ~ NA_character_, 
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

today <- as.character(as.Date(Sys.Date()))

saveRDS(incoming_payments, paste0("output/incoming_payments_", today, ".RData"))
write.csv(incoming_payments, paste0("output/incoming_payments_", today, ".csv"), 
          row.names = FALSE, na = "")
