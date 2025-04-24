package com.ronanski11.mrate.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Document
@Data
public class Rating {

	@Id
	private String id;
	
	private String userId;
	
	private String imdbId;

	private Double narrative;
	
	private Double technical;
	
	private Double performance;
	
	private Double emotional;
	
	private Double cultural;
	
	private Double overall;
	
	private LocalDateTime lastUpdated;

}
