package com.ronanski11.mrate.security.model;

import lombok.Data;

@Data
public class SetupRequest {
	
	private String email;
	
	private String username;
	
	private String password;
	
	private String token;

}
