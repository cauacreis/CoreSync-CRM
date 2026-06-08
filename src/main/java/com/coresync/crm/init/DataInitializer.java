package com.coresync.crm.init;

import com.coresync.crm.model.Company;
import com.coresync.crm.model.Role;
import com.coresync.crm.model.User;
import com.coresync.crm.model.Lead;
import com.coresync.crm.model.LeadStatus;
import com.coresync.crm.repository.CompanyRepository;
import com.coresync.crm.repository.UserRepository;
import com.coresync.crm.repository.LeadRepository;
import com.coresync.crm.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

import com.coresync.crm.model.Product;
import com.coresync.crm.repository.ProductRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final LeadRepository leadRepository;
    private final PasswordEncoder passwordEncoder;
    private final ProductRepository productRepository;

    public DataInitializer(CompanyRepository companyRepository, UserRepository userRepository, LeadRepository leadRepository, PasswordEncoder passwordEncoder, ProductRepository productRepository) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.leadRepository = leadRepository;
        this.passwordEncoder = passwordEncoder;
        this.productRepository = productRepository;
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

            Product licencaP = Product.builder()
                    .name("Licença Premium")
                    .description("Software Enterprise com suporte 24/7")
                    .price(new BigDecimal("50000.00"))
                    .active(true)
                    .companyId(alpha.getId())
                    .build();
            productRepository.save(licencaP);

            Product consultoria = Product.builder()
                    .name("Consultoria de TI")
                    .description("Horas de consultoria arquitetural")
                    .price(new BigDecimal("20000.00"))
                    .active(true)
                    .companyId(alpha.getId())
                    .build();
            productRepository.save(consultoria);

            Lead apple = Lead.builder()
                    .name("Apple Inc.")
                    .email("contact@apple.com")
                    .phone("11999999999")
                    .status(LeadStatus.NEW)
                    .estimatedValue(new BigDecimal("500000.00"))
                    .companyId(alpha.getId())
                    .product(licencaP)
                    .build();
            leadRepository.save(apple);

            Lead microsoft = Lead.builder()
                    .name("Microsoft")
                    .email("sales@microsoft.com")
                    .phone("11888888888")
                    .status(LeadStatus.CONTACTED)
                    .estimatedValue(new BigDecimal("250000.00"))
                    .companyId(alpha.getId())
                    .build();
            leadRepository.save(microsoft);

            Lead amazon = Lead.builder()
                    .name("Amazon AWS")
                    .email("aws@amazon.com")
                    .phone("11777777777")
                    .status(LeadStatus.WON)
                    .estimatedValue(new BigDecimal("1000000.00"))
                    .companyId(alpha.getId())
                    .build();
            leadRepository.save(amazon);

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
