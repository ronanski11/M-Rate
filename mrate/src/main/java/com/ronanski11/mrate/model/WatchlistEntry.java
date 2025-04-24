package com.ronanski11.mrate.model;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class WatchlistEntry {
	
    private Boolean watched = false;
    
    private LocalDateTime addedDate;
    
    private Double rating;
    
}
