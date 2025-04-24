package com.ronanski11.mrate.security;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

	@Value("${jwt.secret.key}")
	private String SECRET_KEY;

	public String extractUsername(String token) {
		return extractClaim(token, Claims::getSubject);
	}
	
	public String generateToken(UserDetails userDetails, String userId) {
		return generateToken(new HashMap<>(), userDetails, userId);
	}
	
	public String generateToken(Map<String, Object> additionalClaims, UserDetails userDetails, String userId) {
	    Map<String, Object> claims = new HashMap<>(additionalClaims);  // Copy additional claims

	    // Get user roles from UserDetails and add them as a claim
	    String roles = userDetails.getAuthorities().stream()
	                              .map(GrantedAuthority::getAuthority)
	                              .collect(Collectors.joining(","));
	    claims.put("roles", roles);  // Add roles to claims
	    claims.put("userId", userId);

	    return Jwts.builder()
	               .setClaims(claims)  // Set the claims including the roles
	               .setSubject(userDetails.getUsername())
	               .setIssuedAt(new Date(System.currentTimeMillis()))
	               .setExpiration(new Date(System.currentTimeMillis() + 7 * 24 * 60 * 60 * 1000L))
	               .signWith(getSigningKey(), SignatureAlgorithm.HS256)
	               .compact();
	}
	
	public boolean isTokenValid(String token, UserDetails userDetails) {
		final String username = extractUsername(token);
		return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
	}
	
	public boolean isTokenExpired(String token) {
		return extractExpiration(token).before(new Date());
	}

	private Date extractExpiration(String token) {
		return extractClaim(token, Claims::getExpiration);
	}

	public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
		final Claims claims = extractAllClaims(token);
		return claimsResolver.apply(claims);
	}

	private Claims extractAllClaims(String token) {
		return Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token).getBody();
	}

	private Key getSigningKey() {
		byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
		return Keys.hmacShaKeyFor(keyBytes);
	}

}
