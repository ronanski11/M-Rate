package com.ronanski11.mrate.model;

import java.util.HashMap;
import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Document
@Data
public class Watchlist {
	
    @Id
    private String id;
    
    private String userId;
    
    private Map<String, WatchlistEntry> movies = new HashMap<>();

}
