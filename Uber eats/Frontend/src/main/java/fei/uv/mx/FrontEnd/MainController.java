package fei.uv.mx.FrontEnd;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainController {

    // Mapeo para la página de inicio de sesión
    @GetMapping("/index")
    public String showLoginPage() {
        return "index"; // Esto busca el archivo login.html dentro de templates
    }

    // Mapeo para la página principal (main.html)
    @GetMapping("/main")
    public String showMainPage() {
        return "main"; // Esto busca el archivo main.html dentro de templates
    }
    
    @GetMapping("/profile")
    public String showProfilePage() {
        return "profile"; // Esto busca el archivo profile.html dentro de templates
    }

    @GetMapping("/help")
    public String showHelpPage() {
        return "help"; // Esto busca el archivo help.html dentro de templates
    }

    @GetMapping("/carrito")
    public String showCartPage() {
        return "carrito"; // Esto busca el archivo carrito.html dentro de templates
    }

    @GetMapping("/mainRepartidor")
    public String showRoundsmanPage() {
        return "mainRepartidor"; // Esto busca el archivo mainRepartidor.html dentro de templates
    }

    @GetMapping("/mainAdmin")
    public String showMainAdminPage() {
        return "mainAdmin"; // Esto busca el archivo mainAdmin.html dentro de templates
    }

    @GetMapping("/administrarRestaurante")
    public String showAdminRestaurantPage() {
        return "administrarRestaurante"; // Esto busca el archivo administrarRestaurante.html dentro de templates
    }

    @GetMapping("/administrarComida")
    public String showAdminFoodPage() {
        return "administrarComida"; // Esto busca el archivo administrarComida.html dentro de templates
    }
}
