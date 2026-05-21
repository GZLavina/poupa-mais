package com.poupa_mais_backend.security;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.cors.CorsConfiguration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class SecurityConfigTest {

    private final SecurityConfig securityConfig = new SecurityConfig(
            mock(JwtAuthenticationFilter.class),
            mock(RestAuthenticationEntryPoint.class),
            mock(RestAccessDeniedHandler.class)
    );

    @Test
    void shouldAllowViteFallbackPortForCorsPreflight() {
        MockHttpServletRequest request = new MockHttpServletRequest(HttpMethod.OPTIONS.name(), "/users");
        request.addHeader("Origin", "http://localhost:5174");
        request.addHeader("Access-Control-Request-Method", HttpMethod.POST.name());

        CorsConfiguration corsConfiguration = securityConfig.corsConfigurationSource().getCorsConfiguration(request);

        assertThat(corsConfiguration).isNotNull();
        assertThat(corsConfiguration.checkOrigin("http://localhost:5174")).isEqualTo("http://localhost:5174");
        assertThat(corsConfiguration.checkHttpMethod(HttpMethod.POST)).contains(HttpMethod.POST);
    }
}
