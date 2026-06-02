package com.coresync.crm.init;

import com.coresync.crm.model.Company;
import com.coresync.crm.model.Role;
import com.coresync.crm.model.User;
import com.coresync.crm.repository.CompanyRepository;
import com.coresync.crm.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(CompanyRepository companyRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (companyRepository.count() == 0) {
            Company alpha = Company.builder()
                    .name("Empresa Alpha")
                    .cnpj("00.000.000/0001-01")
                    .build();
            companyRepository.save(alpha);

            User adminAlpha = User.builder()
                    .name("Admin Alpha")
                    .email("admin@alpha.com")
                    .password(passwordEncoder.encode("123"))
                    .role(Role.ADMIN)
                    .company(alpha)
                    .build();
            userRepository.save(adminAlpha);

            Company beta = Company.builder()
                    .name("Empresa Beta")
                    .cnpj("11.111.111/0001-11")
                    .build();
            companyRepository.save(beta);

            User adminBeta = User.builder()
                    .name("Admin Beta")
                    .email("admin@beta.com")
                    .password(passwordEncoder.encode("123"))
                    .role(Role.ADMIN)
                    .company(beta)
                    .build();
            userRepository.save(adminBeta);

            System.out.println("✅ Dados iniciais gerados com sucesso.");
        }
    }
}
